import pandas as pd

# Load the CSV file
file_path = 'Plynulost_dopravy___Traffic_delays.csv'
traffic_data = pd.read_csv(file_path)

# Filter data for the city "Brno"
brno_traffic_data = traffic_data[traffic_data['city'] == 'Brno']

# Convert 'pubMillis' to a datetime object
brno_traffic_data['pubMillis'] = pd.to_datetime(brno_traffic_data['pubMillis'], errors='coerce')

# Extract the hour from the timestamp
brno_traffic_data['hour'] = brno_traffic_data['pubMillis'].dt.hour

# Group data by hour to calculate average delay
traffic_summary = brno_traffic_data.groupby('hour').agg(
    average_delay=('delay', 'mean'),
    count=('delay', 'size')
).reset_index()

# Define thresholds for traffic levels based on delay
rush_hour_threshold = traffic_summary['average_delay'].quantile(0.75)  # Top 25%
moderate_traffic_threshold = traffic_summary['average_delay'].quantile(0.50)  # Median

# Categorize traffic hours
traffic_summary['traffic_category'] = pd.cut(
    traffic_summary['average_delay'],
    bins=[-1, moderate_traffic_threshold, rush_hour_threshold, float('inf')],
    labels=['Low Traffic', 'Moderate Traffic', 'Rush Hour']
)

# Print categorized hours
rush_hours = traffic_summary[traffic_summary['traffic_category'] == 'Rush Hour']
moderate_traffic = traffic_summary[traffic_summary['traffic_category'] == 'Moderate Traffic']
low_traffic = traffic_summary[traffic_summary['traffic_category'] == 'Low Traffic']

# Display average delay for each category
rush_hour_avg_delay = rush_hours['average_delay'].mean()
moderate_traffic_avg_delay = moderate_traffic['average_delay'].mean()
low_traffic_avg_delay = low_traffic['average_delay'].mean()

# Assume baseline travel time is 600 seconds (10 minutes)
baseline_time = 10*60

# Calculate coefficients for each category
rush_hour_coefficient = rush_hour_avg_delay / baseline_time
moderate_traffic_coefficient = moderate_traffic_avg_delay / baseline_time
low_traffic_coefficient = low_traffic_avg_delay / baseline_time

print("Rush Hours:")
print(rush_hours[['hour', 'average_delay']])
print(f"Average Delay for Rush Hours: {rush_hour_avg_delay:.2f} seconds")
print(f"Rush Hour Coefficient: {rush_hour_coefficient:.2f}")

print("\nModerate Traffic Hours:")
print(moderate_traffic[['hour', 'average_delay']])
print(f"Average Delay for Moderate Traffic: {moderate_traffic_avg_delay:.2f} seconds")
print(f"Moderate Traffic Coefficient: {moderate_traffic_coefficient:.2f}")

print("\nLow Traffic Hours:")
print(low_traffic[['hour', 'average_delay']])
print(f"Average Delay for Low Traffic: {low_traffic_avg_delay:.2f} seconds")
print(f"Low Traffic Coefficient: {low_traffic_coefficient:.2f}")
