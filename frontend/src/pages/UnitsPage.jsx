import SimpleMasterPage from '../components/SimpleMasterPage';

export default function UnitsPage() {
  return (
    <SimpleMasterPage
      title="Unit"
      endpoint="/units/"
      fields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'symbol', label: 'Symbol' },
      ]}
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'symbol', label: 'Symbol' },
      ]}
    />
  );
}
