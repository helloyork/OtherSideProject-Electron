"use client";

import Logo from "@/public/static/images/logo.jpg";


const Constants = {
    routes: {
        HOME: "/",
        MAIN_MENU: "/main-menu",
        ABOUT: "/about",
        GALLERY: "/gallery",
        SAVE: "/save",
        SETTINGS: "/settings",
        PLAYER: "/game/player",
    },
    src: {
        images: {
            LOGO: Logo,
        }
    },
    info: {
        app: {
            name: "OtherSideProject",
            version: "0.0.0"
        }
    }
};

export {
    Constants,
}

