// import { configureStore } from '@reduxjs/toolkit';

// const store = configureStore({
//   reducer: {
//     selectedSerpent: selectedSerpentReducer,
//     selectedDiamond: selectedDiamondReducer,
//   },
// });

// // Infer the `RootState` and `AppDispatch` types from the store itself
// export type RootState = ReturnType<typeof store.getState>;
// // Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
// export type AppDispatch = typeof store.dispatch;

type UiNft = { mint: string; isStaked: boolean };
type UiDiamond = UiNft & {};
type UiSerpent = UiNft & {};

class Store {
  state: {
    diamond: UiDiamond | null;
    serpent: UiSerpent | null;
  } = {
    diamond: null,
    serpent: null,
  };

  listeners: any[] = [];

  addListener(listener: any) {
    this.listeners.push(listener);
    const removeListener = () => {
      this.listeners = this.listeners.filter((l) => listener !== l);
    };
    return removeListener;
  }

  setState(state: any) {
    this.state = { ...this.state, ...state };
    for (const listener of this.listeners) {
      listener(state);
    }
  }

  getState() {
    return this.state;
  }
}

const store = new Store();
export default store;
