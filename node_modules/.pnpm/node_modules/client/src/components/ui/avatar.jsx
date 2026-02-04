import React from 'react';

const avatarStyles = {
    avatar: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        overflow: 'hidden',
        backgroundColor: '#e5e7eb',
    },
    fallback: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        fontWeight: '500',
        textTransform: 'uppercase',
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
};

export function Avatar({ children, className = '', style = {}, ...props }) {
    return (
        <div
            className={className}
            style={{
                ...avatarStyles.avatar,
                width: '2.5rem',
                height: '2.5rem',
                ...style
            }}
            {...props}
        >
            {children}
        </div>
    );
}

export function AvatarImage({ src, alt = '', className = '', style = {}, ...props }) {
    if (!src) return null;
    return (
        <img
            src={src}
            alt={alt}
            className={className}
            style={{ ...avatarStyles.image, ...style }}
            {...props}
        />
    );
}

export function AvatarFallback({ children, className = '', style = {}, ...props }) {
    return (
        <div
            className={className}
            style={{ ...avatarStyles.fallback, ...style }}
            {...props}
        >
            {children}
        </div>
    );
}
