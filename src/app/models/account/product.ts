import {Category} from "./category";
import {User} from "./user";

export class Product {
  id!: number;
  name?: string;
  slug?: any;
  category?: Category | string | number;
  price?: number;
  discount?: number;
  is_available?: boolean;
  available?: any;
  created?: Date;
  user?: User | number | string;
  image?: any;
  description?: string;
}
