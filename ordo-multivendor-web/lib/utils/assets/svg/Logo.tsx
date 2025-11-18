// components/Logo.tsx

import Image from "next/image";

const Logo = ({ className = "" }) => (
 <Image src="/assets/images/png/logo-main.png" alt="Logo" className={className} width={100} height={100} />
);

export default Logo;

