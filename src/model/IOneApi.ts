import IAnything from "./IAnything";

export interface IOneApi<Data = IAnything> {
    reload: () => Promise<void>;
    change: (data: Data) => void;
    getData: () => Data;
};

export default IOneApi;
