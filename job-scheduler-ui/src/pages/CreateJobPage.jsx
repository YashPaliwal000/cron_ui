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
    scheduleType: "ONE_TIME",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cronExpression: "",
    scheduleConfig: {
      frequency: "DAILY",
      times: ["09:00"],
      daysOfWeek: [],
      daysOfMonth: [],
      interval: ""
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      scheduleConfig: {
        ...prev.scheduleConfig,
        [name]: value
      }
    }));
  };

  const handleTimesChange = (e) => {
    const timeArray = e.target.value.split(',').map(t => t.trim());
    setFormData((prev) => ({
      ...prev,
      scheduleConfig: {
        ...prev.scheduleConfig,
        times: timeArray
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.endpoint) {
        showAlert("Name and Endpoint are required", "warning");
        return;
      }
      if (formData.scheduleType === 'ONE_TIME' && !formData.scheduleTime) {
        showAlert("Schedule Time is required for ONE_TIME jobs", "warning");
        return;
      }
      if (formData.scheduleType === "RECURRING" && !formData.cronExpression && !formData.scheduleConfig.frequency) {
        showAlert("Either Cron Expression or Schedule Configuration is required for RECURRING jobs", "warning");
        return;
      }

      const payload = { ...formData };
      if (!payload.scheduleTime) {
        payload.scheduleTime = null;
      }
      if (payload.scheduleType === 'ONE_TIME') {
        payload.cronExpression = null;
        payload.scheduleConfig = null;
      } else if (payload.cronExpression) {
         // if cron is provided, it takes precedence
         payload.scheduleConfig = null;
      }
      
      await jobService.createJob(payload);
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

            <Grid item xs={12} sm={4}>
              <TextField
                select
                required
                fullWidth
                label="Schedule Type"
                name="scheduleType"
                value={formData.scheduleType}
                onChange={handleChange}
              >
                <MenuItem value="ONE_TIME">One Time</MenuItem>
                <MenuItem value="RECURRING">Recurring</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                required={formData.scheduleType === 'ONE_TIME'}
                fullWidth
                label="Schedule Time"
                type="datetime-local"
                name="scheduleTime"
                value={formData.scheduleTime}
                onChange={handleChange}
                helperText={formData.scheduleType === 'RECURRING' ? "Optional start time" : ""}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="Time Zone"
                name="timeZone"
                value={formData.timeZone}
                onChange={handleChange}
              />
            </Grid>

            {formData.scheduleType === 'RECURRING' && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>Schedule Builder</Typography>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    label="Frequency"
                    name="frequency"
                    value={formData.scheduleConfig.frequency}
                    onChange={handleConfigChange}
                  >
                    <MenuItem value="DAILY">Daily</MenuItem>
                    <MenuItem value="WEEKLY">Weekly</MenuItem>
                    <MenuItem value="MONTHLY">Monthly</MenuItem>
                    <MenuItem value="HOURLY">Hourly (Interval)</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    label="Times (comma separated HH:MM)"
                    name="times"
                    value={formData.scheduleConfig.times.join(', ')}
                    onChange={handleTimesChange}
                    placeholder="e.g. 09:00, 13:00"
                    helperText="Required for Daily/Weekly/Monthly"
                  />
                </Grid>

                {formData.scheduleConfig.frequency === 'WEEKLY' && (
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      SelectProps={{ multiple: true }}
                      label="Days of Week"
                      name="daysOfWeek"
                      value={formData.scheduleConfig.daysOfWeek}
                      onChange={handleConfigChange}
                    >
                      {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                        <MenuItem key={day} value={day}>{day}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                )}

                {formData.scheduleConfig.frequency === 'MONTHLY' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Days of Month (comma separated)"
                      name="daysOfMonth"
                      value={formData.scheduleConfig.daysOfMonth.join(',')}
                      onChange={(e) => {
                         const arr = e.target.value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
                         handleConfigChange({ target: { name: 'daysOfMonth', value: arr } });
                      }}
                      placeholder="e.g. 1, 15"
                    />
                  </Grid>
                )}
                
                {formData.scheduleConfig.frequency === 'HOURLY' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Interval (Hours)"
                      name="interval"
                      value={formData.scheduleConfig.interval}
                      onChange={handleConfigChange}
                    />
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Typography variant="subtitle2" align="center" sx={{ my: 1 }}>OR</Typography>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Custom Cron Expression (Overrides builder)"
                    name="cronExpression"
                    value={formData.cronExpression}
                    onChange={handleChange}
                    placeholder="0 0 9 * * ?"
                    helperText="Leave empty to use the Schedule Builder above"
                  />
                </Grid>
              </>
            )}

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
