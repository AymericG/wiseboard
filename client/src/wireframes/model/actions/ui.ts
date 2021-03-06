import { message } from 'antd';
import { AnyAction, Dispatch, Middleware, Reducer } from 'redux';

import { InteractionMode } from '@app/constants';

import { UIState, UIStateInStore } from './../internal';
import { ADD_VISUAL } from './items';
import { calculateCanvasOffset } from '@app/core/utils/canvas-helper';

export const SHOW_INFO_TOAST = 'SHOW_INFO_TOAST';
export const showInfoToast = (text: string) => {
    return { type: SHOW_INFO_TOAST, text };
};

export const SHOW_ERROR_TOAST = 'SHOW_ERROR_TOAST';
export const showErrorToast = (text: string) => {
    return { type: SHOW_ERROR_TOAST, text };
};

export const SET_IS_EDITING_TEXT = 'SET_IS_EDITING_TEXT';
export const startEditing = () => {
    return { type: SET_IS_EDITING_TEXT, value: true };
};

export const stopEditing = () => {
    return { type: SET_IS_EDITING_TEXT, value: false };
};

export const SET_ZOOM = 'SET_ZOOM';
export const setZoom = (zoomLevel: number, worldX?: number, worldY?: number, clientX?: number, clientY?: number) => {
    return (dispatch: Dispatch, getState: () => UIStateInStore) => {
        const offset = calculateCanvasOffset(zoomLevel, worldX, worldY, clientX, clientY, getState);
        return dispatch({ type: SET_ZOOM, payload: { zoomLevel, x: offset.x, y: offset.y }});
    };
};

export const SET_INTERACTION_MODE = 'SET_INTERACTION_MODE';
export const setInteractionMode = (interactionMode: InteractionMode) => {
    return { type: SET_INTERACTION_MODE, interactionMode };
};

export const SET_IS_INTERACTING_WITH_ITEM = 'SET_IS_INTERACTING_WITH_ITEM';
export const setIsInteractingWithItem = (isInteracting: boolean) => {
    return { type: SET_IS_INTERACTING_WITH_ITEM, isInteracting };
};

export const SELECT_COLOR_TAB = 'SELECT_COLOR_TAB';
export const selectColorTab = (tab: string) => {
    return { type: SELECT_COLOR_TAB, tab };
};

export const SELECT_TAB = 'SELECT_TAB';
export const selectTab = (tab: string) => {
    return { type: SELECT_TAB, tab };
};

export const TOGGLE_INFO_DIALOG = 'TOGGLE_INFO_DIALOG';
export const toggleInfoDialog = (isOpen: boolean) => {
    return { type: TOGGLE_INFO_DIALOG, isOpen };
};

export const TOGGLE_LEFT_SIDEBAR = 'TOGGLE_LEFT_SIDEBAR';
export const toggleLeftSidebar = () => {
    return { type: TOGGLE_LEFT_SIDEBAR };
};

export function toastMiddleware() {
    const middleware: Middleware = () => (next: Dispatch<AnyAction>) => (action: any) => {
        switch (action.type) {
            case SHOW_INFO_TOAST:
                message.info(action.text);
                break;
            case SHOW_ERROR_TOAST:
                message.error(action.text);
                break;
        }

        return next(action);
    };

    return middleware;
}

export function ui(initialState: UIState): Reducer<UIState> {
    const reducer: Reducer<UIState> = (state = initialState, action: any) => {
        switch (action.type) {
            case ADD_VISUAL:
                return { ...state, isEditingText: true};
            case SET_IS_EDITING_TEXT:
                return { ...state, isEditingText: action.value };
            case SET_INTERACTION_MODE:
                return { ...state, interactionMode: action.interactionMode };
            case SET_IS_INTERACTING_WITH_ITEM:
                return { ...state, isInteractingWithItem: action.isInteracting };
            case SET_ZOOM:
                return { ...state, zoom: action.payload.zoomLevel, x: action.payload.x, y: action.payload.y };
            case SELECT_TAB:
                return { ...state, selectedTab: action.tab };
            case SELECT_COLOR_TAB:
                return { ...state, selectedColorTab: action.tab };
            case TOGGLE_INFO_DIALOG:
                return { ...state, showInfoDialog: action.isOpen };
            case TOGGLE_LEFT_SIDEBAR:
                return { ...state, showLeftSidebar: !state.showLeftSidebar };
            default:
                return state;
        }
    };

    return reducer;
}