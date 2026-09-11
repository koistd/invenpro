import SimpleMasterPage from '../components/SimpleMasterPage';

export default function CategoriesPage() {
  return (
    <SimpleMasterPage
      title="Category"
      endpoint="/categories/"
      fields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
      ]}
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'description', label: 'Description' },
      ]}
    />
  );
}
