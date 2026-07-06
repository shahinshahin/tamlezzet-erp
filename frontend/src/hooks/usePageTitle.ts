import { useEffect } from 'react';
import { useAppDispatch } from './useAppDispatch';
import { setPageTitle } from '../store/slices/uiSlice';

export const usePageTitle = (title: string) => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(setPageTitle(title));
    document.title = `${title} | TamLezzet ERP`;
  }, [title, dispatch]);
};
