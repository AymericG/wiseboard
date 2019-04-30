import { InteractionMode } from '@app/constants';

export interface UIState {
    // The current zoom level.
    zoom: number;

    isEditingText: boolean;

    // The error toast from any loading operation.
    errorToast?: string;

    // The info toast from any loading operation.
    infoToast?: string;

    // Indicates if the cursor will select or move the board around.
    interactionMode: InteractionMode;

    isInteractingWithItem: boolean;

    // Indicates if the info dialog is open.
    showInfoDialog: boolean;

    // Indicates if the left sidebar is open.
    showLeftSidebar: boolean;

    // The selected tab on the left sidebar.
    selectedTab: string;

    // The color tab.
    selectedColorTab: string;

    x: number;
    y: number;
}

export interface UIStateInStore {
    ui: UIState;
}

export const createInitialUIState: () => UIState = () => {
    return {
        x: 0,
        y: 0,
        isEditingText: false,
        zoom: 1,
        selectedTab: 'shapes',
        isInteractingWithItem: false,
        interactionMode: InteractionMode.Selection,
        showInfoDialog: false,
        showLeftSidebar: false,
        selectedColorTab: 'palette'
    };
};