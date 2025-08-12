import { type SchemaTypeDefinition } from 'sanity';
import { heroImg } from './heroImg';
import companiesImg from './companiesImg';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [heroImg, companiesImg],
};
