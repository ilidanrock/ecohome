import { UserIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export const heroImg = defineType({
  name: 'heroImg',
  title: 'Hero Image',
  description: 'Hero image for the homepage',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'string',
    }),
    defineField({
      name: 'imgURL',
      title: 'Image URL',
      type: 'image',
    }),
  ],
});
