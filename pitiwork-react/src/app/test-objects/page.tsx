'use client';

import * as React from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { useKeycloak } from '@react-keycloak/web';

import { TestObjectsTable } from '@/components/dashboard/test-objects/test-objects-table';
import type { TestObject } from '@/components/dashboard/test-objects/test-objects-table';
import { TestObjectModal } from '@/components/dashboard/test-objects/test-object-modal';
import { fetchOData, createOData, updateOData, deleteOData } from '@/lib/odata-client';

const API_URL = 'http://localhost:5003/api/odata/TestObject1';

export default function TestObjectsPage(): React.JSX.Element {
  const { keycloak, initialized } = useKeycloak();
  const [data, setData] = React.useState<TestObject[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [editingObject, setEditingObject] = React.useState<TestObject | null>(null);

  const fetchData = React.useCallback(async () => {
    if (initialized && keycloak.authenticated) {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchOData(keycloak, API_URL);
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const result = await response.json();
        setData(result.value || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }
  }, [initialized, keycloak]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenAddModal = () => {
    setEditingObject(null);
    setIsModalOpen(true);
  };

  const handleEdit = (row: TestObject) => {
    setEditingObject(row);
    setIsModalOpen(true);
  };

  const handleDelete = async (oid: string) => {
    if (!keycloak.authenticated) return;

    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await deleteOData(keycloak, API_URL, oid);
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Failed to delete data: ${errorData}`);
        }
        await fetchData(); // Refresh data after delete
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingObject(null);
  };

  const handleSave = async (values: { Name: string; DisplayName: string }) => {
    if (!keycloak.authenticated) return;

    try {
      let response;
      if (editingObject) {
        // Update existing object
        response = await updateOData(keycloak, API_URL, editingObject.Oid, values);
      } else {
        // Create new object
        response = await createOData(keycloak, API_URL, values);
      }

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to save data: ${errorData}`);
      }

      handleCloseModal();
      await fetchData(); // Refresh data after save
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  return (
    <React.Fragment>
      <Stack spacing={3}>
        <Stack direction="row" spacing={3}>
          <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
            <Typography variant="h4">Test Objects</Typography>
            <Typography variant="body1">A simple page to manage your TestObject1 data.</Typography>
          </Stack>
          <div>
            <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={handleOpenAddModal}>
              Add
            </Button>
          </div>
        </Stack>
        {isLoading ? (
          <CircularProgress />
        ) : error ? (
          <Alert color="error">{error}</Alert>
        ) : (
          <TestObjectsTable rows={data} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </Stack>
      <TestObjectModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        initialData={editingObject}
      />
    </React.Fragment>
  );
}

