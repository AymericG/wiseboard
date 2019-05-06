export interface LoadingState {
    // Indicates if the loading operation is in progress.
    isLoading: boolean;
    isLoaded: boolean;

    // Indicates if the saving operation is in progress.
    isSaving: boolean;

    // The read token.
    readToken?: string | null;

    // The write token.
    writeToken?: string | null;
}

export interface LoadingStateInStore {
    loading: LoadingState;
}

export const createInitialLoadingState: () => LoadingState = () => {
    return {
        isLoaded: false,
        isLoading: false,
        isSaving: false
    };
};