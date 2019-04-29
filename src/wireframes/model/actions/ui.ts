import { message } from 'antd';
import { AnyAction, Dispatch, Middleware, Reducer } from 'redux';

import { InteractionMode } from '@app/constants';

import { UIState, UIStateInStore } from './../internal';

export const SHOW_INFO_TOAST = 'SHOW_INFO_TOAST';
export const showInfoToast = (text: string) => {
    return { type: SHOW_INFO_TOAST, text };
};

export const SHOW_ERROR_TOAST = 'SHOW_ERROR_TOAST';
export const showErrorToast = (text: string) => {
    return { type: SHOW_ERROR_TOAST, text };
};

export const SET_ZOOM = 'SET_ZOOM';
export const setZoom = (zoomLevel: number, worldX?: number, worldY?: number, clientX?: number, clientY?: number) => {
    return (dispatch: Dispatch, getState: () => UIStateInStore) => {
    
        if (!worldX) {
            const editorView = document.getElementById('editor-view');
            const rect = editorView.getBoundingClientRect();
            clientX = rect.width / 2;
            clientY = rect.height / 2;

            const state = getState();
            const zoom = state.ui.zoom;
            const x = state.ui.x;
            const y = state.ui.y;
            
            worldX = (clientX - x) / zoom;
            worldY = (clientY - y) / zoom;
        }

        const newX = clientX - worldX * zoomLevel;
        const newY = clientY - worldY * zoomLevel;

        return dispatch({ type: SET_ZOOM, payload: { zoomLevel, x: newX, y: newY }});
    };
};

export const MOVE_TO = 'MOVE_TO';
export const moveTo = (x: number, y: number) => {
    return { type: MOVE_TO, payload: { x, y }};
};

export const SET_INTERACTION_MODE = 'SET_INTERACTION_MODE';
export const setInteractionMode = (interactionMode: InteractionMode) => {
    return { type: SET_INTERACTION_MODE, interactionMode };
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
            case SET_INTERACTION_MODE:
                return { ...state, interactionMode: action.interactionMode };
            case SET_ZOOM:
                return { ...state, zoom: action.payload.zoomLevel, x: action.payload.x, y: action.payload.y };
            case MOVE_TO:
                return { ...state, x: action.payload.x, y: action.payload.y };
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