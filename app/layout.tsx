import type {Metadata} from "next";
import "./globals.css";
const siteUrl="https://molar-quest-claire.yiko1.chatgpt.site";
export const metadata:Metadata={title:"Butterland — Claire and her four cats",description:"A cozy pixel game about a home full of cats.",openGraph:{title:"Butterland",description:"Claire and her four cats",images:[`${siteUrl}/og.png`]},twitter:{card:"summary_large_image",title:"Butterland",description:"Claire and her four cats",images:[`${siteUrl}/og.png`]}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
