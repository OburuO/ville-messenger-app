import { atom } from "recoil";

export const screenState = atom({
    key: 'screenState',
    default: true,
});

export const convoState = atom({
    key: 'convoState',
    default: false,
});

export const sliderRailState = atom({
    key: 'sliderRailState',
    default: false,
});

export const createUserModalState = atom({
    key: 'createUserModalState',
    default: false, 
});