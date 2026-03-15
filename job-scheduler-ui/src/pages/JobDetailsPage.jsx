import { Container, Typography, Box, Paper, Button, Grid, Chip, Divider } from "@mui/material";
import { ArrowBack, PlayArrow, Pause, Edit, Delete, History } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAlert } from "../context/AlertContext";
import jobService from "../services/jobService";

const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [job, setJob] = useState(null);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const response = await jobService.getJob(id);
      setJob(response.data);
    } catch (error) {
      console.error("Error fetching job details:", error);
      showAlert("Failed to load job details", "error");
    }
  };

  const handleAction = async (action) => {
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
        navigate("/jobs");
        return; // Don't fetch details for a deleted job
      }
      fetchJobDetails(); // Refresh details
    } catch (error) {
      console.error(`Error performing ${action} on job ${id}:`, error);
      showAlert(`Failed to ${action.toLowerCase()} job`, "error");
    }
  };

  if (!job) return <Container><Typography>Loading...</Typography></Container>;

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          Back
        </Button>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          Job Details
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            color={job.status === 'ACTIVE' ? "warning" : "success"}
            startIcon={job.status === 'ACTIVE' ? <Pause /> : <PlayArrow />}
            onClick={() => handleAction(job.status === 'ACTIVE' ? 'PAUSE' : 'RESUME')}
          >
            {job.status === 'ACTIVE' ? "Pause" : "Resume"}
          </Button>
          <Button variant="outlined" startIcon={<Edit />}>Edit</Button>
          <Button 
            variant="outlined" 
            startIcon={<History />}
            onClick={() => navigate(`/jobs/${id}/history`)}
          >
            History
          </Button>
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<Delete />}
            onClick={() => handleAction('DELETE')}
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Configuration</Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={4}><Typography color="text.secondary">Name</Typography></Grid>
              <Grid item xs={8}><Typography fontWeight="medium">{job.name}</Typography></Grid>
              
              <Grid item xs={4}><Typography color="text.secondary">Endpoint</Typography></Grid>
              <Grid item xs={8}><Typography>{job.endpoint}</Typography></Grid>
              
              <Grid item xs={4}><Typography color="text.secondary">Method</Typography></Grid>
              <Grid item xs={8}>
                <Chip label={job.method} size="small" variant="outlined" />
              </Grid>
              
              <Grid item xs={4}><Typography color="text.secondary">Headers</Typography></Grid>
              <Grid item xs={8}>
                <Box component="pre" sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 1, m: 0, overflow: 'auto' }}>
                  {typeof job.headers === 'object' ? JSON.stringify(job.headers, null, 2) : (job.headers || "{}")}
                </Box>
              </Grid>

              <Grid item xs={4}><Typography color="text.secondary">Payload</Typography></Grid>
              <Grid item xs={8}>
                <Box component="pre" sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 1, m: 0, overflow: 'auto' }}>
                  {typeof job.payload === 'object' ? JSON.stringify(job.payload, null, 2) : (job.payload || "{}")}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Status & Scheduling</Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={5}><Typography color="text.secondary">Status</Typography></Grid>
              <Grid item xs={7}>
                <Chip 
                  label={job.status} 
                  color={job.status === 'ACTIVE' ? 'success' : 'warning'} 
                  size="small" 
                />
              </Grid>
              
              <Grid item xs={5}><Typography color="text.secondary">Next Run</Typography></Grid>
              <Grid item xs={7}><Typography>{job.nextRun ? new Date(job.nextRun * 1000).toLocaleString() : (job.scheduleTime || 'N/A')}</Typography></Grid>
              
              <Grid item xs={5}><Typography color="text.secondary">Last Run</Typography></Grid>
              <Grid item xs={7}><Typography>{job.lastRunTime ? new Date(job.lastRunTime * 1000).toLocaleString() : 'N/A'}</Typography></Grid>
              
              <Grid item xs={5}><Typography color="text.secondary">Last Result</Typography></Grid>
              <Grid item xs={7}>
                <Chip 
                  label={job.lastStatus || job.lastRunStatus || 'N/A'} 
                  color={(job.lastStatus || job.lastRunStatus) === 'SUCCESS' ? 'success' : 'error'} 
                  size="small"
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={5}><Typography color="text.secondary">Created At</Typography></Grid>
              <Grid item xs={7}><Typography>{job.createdAt ? new Date(job.createdAt * 1000).toLocaleString() : 'N/A'}</Typography></Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default JobDetailsPage;
