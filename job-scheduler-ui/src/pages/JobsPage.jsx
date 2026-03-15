import { Container, Typography, Box, Button, Paper, Chip } from "@mui/material";
import { AddBox, Edit, PlayArrow, Pause, Delete, History } from "@mui/icons-material";
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAlert } from "../context/AlertContext";
import jobService from "../services/jobService";

const JobsPage = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await jobService.getJobs();
      setJobs(response.data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      showAlert("Failed to load jobs list", "error");
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === "PAUSE") {
        await jobService.pauseJob(id);
        showAlert("Job paused successfully", "success");
      } else if (action === "RESUME") {
        await jobService.resumeJob(id);
        showAlert("Job resumed successfully", "success");
      } else if (action === "DELETE") {
        await jobService.deleteJob(id);
        showAlert("Job deleted successfully", "success");
      }
      fetchJobs(); // refresh grid
    } catch (error) {
      console.error(`Error performing ${action} on job ${id}:`, error);
      showAlert(`Failed to ${action.toLowerCase()} job`, "error");
    }
  };

  const columns = [
    { field: 'name', headerName: 'Job Name', flex: 1, minWidth: 150 },
    { field: 'endpoint', headerName: 'Endpoint', flex: 1.5, minWidth: 200 },
    { field: 'method', headerName: 'Method', width: 90 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 130,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value === 'ACTIVE' ? 'success' : 'warning'} 
          size="small" 
          variant="outlined" 
        />
      )
    },
    { 
      field: 'scheduleType', 
      headerName: 'Type', 
      width: 120,
      renderCell: (params) => {
        // Fallback for older jobs that might not have scheduleType but have a cron Expression
        const type = params.value || (params.row.cronExpression || params.row.scheduleConfig ? 'RECURRING' : 'ONE_TIME');
        return (
          <Chip 
            label={type} 
            color={type === 'RECURRING' ? "secondary" : "info"} 
            size="small" 
            variant="outlined" 
          />
        );
      }
    },
    { 
      field: 'nextRun', 
      headerName: 'Next Run', 
      width: 170,
      valueFormatter: (params) => {
        if (!params) return "";
        try {
          const date = new Date(params);
          return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleString();
        } catch (e) {
          return "Invalid Date";
        }
      }
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Edit />}
          label="Edit"
          onClick={() => navigate(`/jobs/${params.id}`)}
        />,
        <GridActionsCellItem
          icon={params.row.status === 'ACTIVE' ? <Pause /> : <PlayArrow />}
          label={params.row.status === 'ACTIVE' ? 'Pause' : 'Resume'}
          onClick={() => handleAction(params.id, params.row.status === 'ACTIVE' ? 'PAUSE' : 'RESUME')}
        />,
        <GridActionsCellItem
          icon={<History />}
          label="History"
          onClick={() => navigate(`/jobs/${params.id}/history`)}
          showInMenu
        />,
        <GridActionsCellItem
          icon={<Delete sx={{ color: 'error.main'}} />}
          label="Delete"
          onClick={() => handleAction(params.id, 'DELETE')}
          showInMenu
        />,
      ],
    },
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Jobs Management
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddBox />}
          onClick={() => navigate('/jobs/create')}
        >
          Create New Job
        </Button>
      </Box>

      <Paper sx={{ width: '100%', height: 'calc(100vh - 200px)' }}>
        <DataGrid
          rows={jobs}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 15 },
            },
          }}
          pageSizeOptions={[15, 50, 100]}
          disableRowSelectionOnClick
        />
      </Paper>
    </Container>
  );
};

export default JobsPage;
