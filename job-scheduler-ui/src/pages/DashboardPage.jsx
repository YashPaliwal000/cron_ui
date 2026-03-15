import { Container, Typography, Grid, Paper, Box, Button } from "@mui/material";
import { AddBox, PlayArrow, Pause, Delete, Visibility } from "@mui/icons-material";
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAlert } from "../context/AlertContext";
import jobService from "../services/jobService";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, paused: 0, failed: 0 });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await jobService.getJobs();
      const fetchedJobs = response.data || [];
      setJobs(fetchedJobs);
      
      setStats({
        total: fetchedJobs.length,
        active: fetchedJobs.filter(j => j.status === "ACTIVE").length,
        paused: fetchedJobs.filter(j => j.status === "PAUSED").length,
        failed: fetchedJobs.filter(j => j.lastStatus === "FAILED").length,
      });
    } catch (error) {
      console.error("Error fetching jobs:", error);
      showAlert("Failed to load jobs dashboard data", "error");
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
    { field: 'name', headerName: 'Job Name', flex: 1 },
    { field: 'endpoint', headerName: 'Endpoint', flex: 1 },
    { field: 'status', headerName: 'Status', width: 120 },
    { 
      field: 'nextRun', 
      headerName: 'Next Run Time', 
      width: 170,
      valueFormatter: (params) => {
        if (!params) return "";
        // Multiply by 1000 if it's Unix seconds
        const date = new Date(params * 1000);
        return date.toLocaleString();
      }
    },
    { field: 'lastStatus', headerName: 'Last Status', width: 120 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          icon={params.row.status === 'ACTIVE' ? <Pause /> : <PlayArrow />}
          label={params.row.status === 'ACTIVE' ? 'Pause' : 'Resume'}
          onClick={() => handleAction(params.id, params.row.status === 'ACTIVE' ? 'PAUSE' : 'RESUME')}
        />,
        <GridActionsCellItem
          icon={<Visibility />}
          label="View Details"
          onClick={() => navigate(`/jobs/${params.id}`)}
          showInMenu
        />,
        <GridActionsCellItem
          icon={<Delete />}
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
          Dashboard
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddBox />}
          onClick={() => navigate('/jobs/create')}
        >
          Create Job
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Jobs', value: stats.total, color: 'primary.main' },
          { label: 'Active Jobs', value: stats.active, color: 'success.main' },
          { label: 'Paused Jobs', value: stats.paused, color: 'warning.main' },
          { label: 'Failed Jobs', value: stats.failed, color: 'error.main' },
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 140,
              }}
            >
              <Typography color="text.secondary" gutterBottom variant="h6">
                {stat.label}
              </Typography>
              <Typography component="p" variant="h3" sx={{ color: stat.color, fontWeight: 'medium' }}>
                {stat.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">Recent Jobs</Typography>
        </Box>
        <DataGrid
          rows={jobs}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10]}
          disableRowSelectionOnClick
          autoHeight
        />
      </Paper>
    </Container>
  );
};

export default DashboardPage;
