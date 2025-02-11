import IAnything from "../../../model/IAnything";
import IOneProps from "../../../model/IOneProps";

import IFeatureGroup from "./IFeatureGroup";

export interface IFeatureViewProps<Data extends IAnything = IAnything, Payload = IAnything> extends Omit<IOneProps<Data, Payload>, keyof {
    fields: never;
}> {
    features: IFeatureGroup<Data, Payload>[];
}

export default IFeatureViewProps;
