
export const companiesImg = {
  name: 'companiesImg',
  title: 'Companies Image',
  type: 'document',
  icon: () => '🏢'  ,
    fields: [
        {
        name: 'name',
        title: 'Name',
        type: 'string',
        },
        {
        name: 'description',
        title: 'Description',
        type: 'string',
        },
        {
        name: 'imgURL',
        title: 'Image URL',
        type: 'image'
        },
    ]
}
export default companiesImg