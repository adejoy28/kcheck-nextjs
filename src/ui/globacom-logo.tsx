import Image from 'next/image';

export default function GlobacomLogo() {
    return (
        <Image
            src="/images/logo.png"
            alt="Globacom Logo"
            width={60}
            height={60}
            className="mb-4"
        />
        // <div className="flex flex-col items-center justify-center bg-[#6489c0] text-white px-8 py-10 md:py-16 md:flex-[1.2] text-center">
        //     <Image
        //         src="/images/logo.png"
        //         alt="Globacom Logo"
        //         width={60}
        //         height={60}
        //         className="mb-4"
        //     />
        //     <h3 className="text-xl font-500">Knowledge Check</h3>
        //     <span className="text-sm opacity-75 mt-1">Version 1.0.0</span>
        // </div>
    );
}
