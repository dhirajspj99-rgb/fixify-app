import AdminDashboard from './components/AdminDashboard';

export const metadata = {
  title: 'Fixifiy Master Admin',
  description: 'Super Admin Portal for Fixifiy OS',
};

export default function AdminPage() {
  return (
    <main>
      <AdminDashboard />
    </main>
  );
}