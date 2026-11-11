import type {Metadata} from 'next';
import './globals.css';
import 'katex/dist/katex.min.css';
export const metadata:Metadata={title:'Boye Digital School AI · Mathematics Tutor',description:'A patient study partner for Nigerian secondary school students.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
