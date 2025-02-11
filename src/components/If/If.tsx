import * as React from 'react';

import { useLayoutEffect, useEffect, useRef, useState } from 'react';

import cancelable, { IWrappedFn, CANCELED_SYMBOL } from '../../utils/hof/cancelable';

export interface IIfProps<T extends any = object> {
    condition:  boolean | ((payload: T) => boolean | Promise<boolean>);
    children: React.ReactNode;
    fallback?: (e: Error) => void;
    onLoadStart?: () => void;
    onLoadEnd?: (isOk: boolean) => void;
    payload?: T;
    deps?: any[];
    throwError?: boolean;
}

export const If = <T extends any = object>({
    children,
    condition,
    fallback,
    onLoadStart,
    onLoadEnd,
    payload,
    deps = [],
    throwError = false,
}: IIfProps<T>) => {

    const [pass, setPass] = useState(false);
    const executionRef = useRef<IWrappedFn<boolean> | null>(null);

    const isMounted = useRef(true);

    useLayoutEffect(() => () => {
      isMounted.current = false;
    }, []);

    useEffect(() => {

        if (executionRef.current) {
            executionRef.current.cancel();
        }

        const execute = cancelable(async () => {
            let isOk = true;
            onLoadStart && onLoadStart();
            try {
                if (typeof condition === 'function') {
                    return await Promise.resolve(condition(payload!));
                } else {
                    return condition;
                }
            } catch (e) {
                isOk = false;
                throw e;
            } finally {
                onLoadEnd && onLoadEnd(isOk);
            }
        });

        executionRef.current = execute;

        const process = async () => {
            try {
                const result = await execute();
                if (result === CANCELED_SYMBOL) {
                    return;
                }
                executionRef.current = null;
                isMounted.current && setPass(result);
            } catch (e) {
                isMounted.current && setPass(false);
                if (!throwError) {
                    fallback && fallback(e as Error);
                } else {
                    throw e;
                }
            }
        };

        process();
    }, [payload, ...deps]);


    if (pass) {
        return (
            <>
                {children}
            </>
        );
    } else {
        return null;
    }

};

export default If;
