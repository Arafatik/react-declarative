import { useState, useEffect } from 'react';

import Entity, { IEntity } from "../utils/mvvm/Entity";

import useActualCallback from './useActualCallback';

interface IParams<T extends IEntity = any> {
    initialValue: T | Entity<T>;
    onChange?: (item: Entity<T>) => void;
}

export const useItemEntity = <T extends IEntity = any>({
    initialValue,
    onChange = () => null,
}: IParams<T>) => {
    const [entity, setEntity] = useState(() => new Entity(initialValue));
    const handleChange = useActualCallback(onChange);
    useEffect(() => entity.handleChange((entity) => {
        setEntity(new Entity(entity));
        handleChange(entity);
    }), [entity]);
    return entity;
};

export default useItemEntity;
