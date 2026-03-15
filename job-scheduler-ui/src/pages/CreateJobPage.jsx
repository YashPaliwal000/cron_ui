import { useState } from "react";
import { 
  Container, Typography, Box, Paper, TextField, Button, 
  MenuItem, Grid, Divider 
} from "@mui/material";
import { Save, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import { useAlert } from "../context/AlertContext";
import jobService from "../services/jobService";

const CreateJobPage = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [formData, setFormData] = useState({
    name: "",
    endpoint: "",
    method: "GET",
    headers: "",
    payload: "",
    scheduleTime: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.endpoint || !formData.scheduleTime) {
        showAlert("Name, Endpoint and Schedule Time are required", "warning");
        return;
      }
      await jobService.createJob(formData);
      showAlert("Job created successfully", "success");
      navigate("/jobs");
    } catch (error) {
      console.error("Error creating job:", error);
      const errMsg = error.response?.data?.message || "Failed to create job";
      showAlert(errMsg, "error");
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/jobs')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          Create New Job
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Basic Information</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Job Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                required
                fullWidth
                label="API Endpoint URL"
                name="endpoint"
                value={formData.endpoint}
                onChange={handleChange}
                placeholder="https://api.example.com/v1/trigger"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                required
                fullWidth
                label="HTTP Method"
                name="method"
                value={formData.method}
                onChange={handleChange}
              >
                {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Request Details</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Headers (JSON format)"
                name="headers"
                multiline
                rows={3}
                value={formData.headers}
                onChange={handleChange}
                placeholder='{"Authorization": "Bearer token"}'
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Payload (JSON format)"
                name="payload"
                multiline
                rows={4}
                value={formData.payload}
                onChange={handleChange}
                disabled={['GET', 'DELETE'].includes(formData.method)}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Scheduling</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Schedule Time"
                type="datetime-local"
                name="scheduleTime"
                value={formData.scheduleTime}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/jobs')}
                sx={{ mr: 2 }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                startIcon={<Save />}
              >
                Save Job
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateJobPage;
