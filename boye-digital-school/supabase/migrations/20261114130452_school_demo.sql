create schema if not exists school_demo;
revoke all on schema school_demo from public, anon, authenticated;

create table school_demo.limits (
  day date not null,
  action text not null,
  visitor text not null,
  used integer not null default 0,
  primary key (day, action, visitor)
);
create table school_demo.events (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  action text not null,
  subject text
);
create index on school_demo.events (occurred_at);
create table school_demo.feedback (
  id bigint generated always as identity primary key,
  submitted_at timestamptz not null default now(),
  school text not null,
  representative text not null,
  email text not null,
  phone text not null,
  feedback text not null,
  follow_up boolean not null
);
create index on school_demo.feedback (submitted_at);
alter table school_demo.limits enable row level security;
alter table school_demo.events enable row level security;
alter table school_demo.feedback enable row level security;

create function public.record_school_demo_action(
  p_action text, p_visitor text, p_subject text, p_feedback jsonb
) returns text
language plpgsql security invoker set search_path = ''
as $$
declare
  today date := (now() at time zone 'Africa/Lagos')::date;
  visitor_cap integer;
  daily_cap integer;
begin
  case p_action
    when 'tutor' then visitor_cap := 3; daily_cap := 20;
    when 'feedback' then visitor_cap := 2; daily_cap := 50;
    when 'visit' then visitor_cap := 30; daily_cap := 2000;
    when 'booking' then visitor_cap := 10; daily_cap := 500;
    else raise exception 'Invalid demo action';
  end case;

  if p_visitor is null or p_visitor !~ '^[a-f0-9]{64}$' then
    raise exception 'Invalid visitor identifier';
  end if;
  if p_action = 'tutor' and (p_subject is null or p_subject not in ('Mathematics', 'English', 'Biology')) then
    raise exception 'Invalid subject';
  end if;

  -- Lock the shared counter before the visitor counter, across all app instances.
  insert into school_demo.limits (day, action, visitor)
  values (today, p_action, '') on conflict do nothing;
  perform 1 from school_demo.limits
    where day = today and action = p_action and visitor = '' for update;
  if (select used from school_demo.limits
      where day = today and action = p_action and visitor = '') >= daily_cap then
    return 'daily';
  end if;

  insert into school_demo.limits as counter (day, action, visitor, used)
  values (today, p_action, p_visitor, 1)
  on conflict (day, action, visitor) do update set used = counter.used + 1
    where counter.used < visitor_cap;
  if not found then return 'visitor'; end if;

  update school_demo.limits set used = used + 1
    where day = today and action = p_action and visitor = '';
  if p_action = 'feedback' then
    insert into school_demo.feedback (school, representative, email, phone, feedback, follow_up)
    values (p_feedback->>'school', p_feedback->>'representative', p_feedback->>'email',
      p_feedback->>'phone', p_feedback->>'feedback', (p_feedback->>'followUp')::boolean);
  end if;
  insert into school_demo.events (action, subject)
  values (p_action, case when p_action = 'tutor' then p_subject end);
  return 'accepted';
end;
$$;

grant usage on schema school_demo to service_role;
grant select, insert, update on school_demo.limits to service_role;
grant insert on school_demo.events, school_demo.feedback to service_role;
grant usage on all sequences in schema school_demo to service_role;
revoke all on function public.record_school_demo_action(text,text,text,jsonb) from public, anon, authenticated;
grant execute on function public.record_school_demo_action(text,text,text,jsonb) to service_role;
