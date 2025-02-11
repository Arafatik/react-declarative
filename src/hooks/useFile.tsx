import React from 'react';
import { useRef } from 'react';

interface IParams {
  accept?: string;
  onSelect?: (...files: File[]) => void;
}

export const useFile = ({
  accept,
  onSelect,
}: IParams) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const onChange = () => {
    const files = inputRef.current?.files;
    if (!files?.length) {
      return;
    } else {
      onSelect && onSelect(...Array.from(files))
      inputRef.current && (inputRef.current.value = '')
    }
  };
  const render = () => (
    <input
      type="file"
      style={{ display: 'none' }}
      onChange={onChange}
      ref={inputRef}
      accept={accept}
    />
  );
  const open = () => {
    inputRef.current?.click();
  };
  return {
    render,
    open,
  };
};

export default useFile;
