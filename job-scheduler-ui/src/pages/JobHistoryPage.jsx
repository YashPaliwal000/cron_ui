import { Container, Typography, Box, Paper, Button, Chip } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAlert } from "../context/AlertContext";
import jobService from "../services/jobService";

const JobHistoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, [id]);

  const fetchHistory = async () => {
    try {
      const response = await jobService.getJobHistory(id);
      setLogs(response.data || []);
    } catch (error) {
      console.error("Error fetching job history:", error);
      showAlert("Failed to load execution history", "error");
    }
  };

  const columns = [
    { field: 'executedAt', headerName: 'Execution Time', flex: 1, minWidth: 200 },
    { field: 'durationMs', headerName: 'Duration (ms)', width: 130 },
    { field: 'responseCode', headerName: 'Status Code', width: 130 },
    { 
      field: 'status', 
      headerName: 'Result', 
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value === 'SUCCESS' ? 'success' : 'error'} 
          size="small" 
        />
      )
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          Back
        </Button>
        <Typography variant="h4" component="h1">
          Execution History (Job #{id})
        </Typography>
      </Box>

      <Paper sx={{ width: '100%', height: 'calc(100vh - 200px)' }}>
        <DataGrid
          rows={logs}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 20 },
            },
            sorting: {
              sortModel: [{ field: 'executedAt', sort: 'desc' }],
            },
          }}
          pageSizeOptions={[20, 50, 100]}
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
            },
          }}
        />
      </Paper>
    </Container>
  );
};

export default JobHistoryPage;
