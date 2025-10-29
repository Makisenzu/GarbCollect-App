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
            className={`group flex items-center w-full px-4 py-3 text-sm font-medium transition-all duration-200 rounded-xl ${
                active 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-200' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
            }`}
            {...props}
        >
            {children}
        </Link>
    );
}