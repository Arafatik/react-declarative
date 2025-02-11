export const mainColor = (color: string) => {
    document.head.innerHTML += (`
        <meta name="theme-color" content="${color}">
        <style>
            html {
                background: ${color} !important;
            }
        </style>
    `);
};

export default mainColor;
