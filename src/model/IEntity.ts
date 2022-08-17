import IAnything from './IAnything';
import IField from './IField';

type exclude = 'defaultValue'

/**
 * Объект сущность представляет собой поле прикладного
 * программииста, расширенное входным параметром и
 * коллбеком изменения для внутренней организации
 * работы. ВАЖНО - изменение поля влечет изменение
 * всего целевого объекта, следуя паттерну immutable
 */
export interface IEntity<Data = IAnything> extends Omit<IField<Data>, exclude> {
  change?: (object: Data, invalidMap: Record<string, boolean>) => void;
  invalidity: (name: string, msg: string) => void;
  fallback: (e: Error) => void;
  dirty?: boolean;
  prefix: string;
  ready: () => void;
  object: Data;
}

export default IEntity;
