import { Link } from '@inertiajs/react';

export default function SidebarLink({
    href,
    active = false,
    children,
    method = 'get',
    as = 'a',
    ...props
}) {
    const handleMouseDown = (e) => {
        e.preventDefault();
    };

    return (
        <Link
            href={href}
            method={method}
            as={as}
            onMouseDown={handleMouseDown}
            className={`flex items-center w-full px-4 py-4 transition-colors duration-200 rounded-none ${
                active 
                    ? 'bg-green-100 text-green-800 border-l-4 border-green-600' 
                    : 'border-l-4 border-transparent hover:bg-gray-100'
            }`}
            {...props}
        >
            {children}
        </Link>
    );
}