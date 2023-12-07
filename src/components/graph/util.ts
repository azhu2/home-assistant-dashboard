import { Children, ReactElement, ReactNode } from 'react';
import * as base from '../base';
import './graph.css';

export function getPropsOfChildType<P extends base.BaseEntityProps>(children: ReactNode, expType: Function): {[key: string]: P} | undefined {
    return Children.map(children, c => c)?.
        filter((c): c is ReactElement => {return typeof(c) === 'object' && 'type' in c && c.type === expType}).
        reduce((arr, cur) => {
            const props = cur.props as unknown as P;
            return { ...arr, [props.entityID.getCanonicalized()]: props };
        }, {} as { string: P })
}
