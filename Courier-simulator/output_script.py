import re
import statistics

def parse_simulation_log(filename):
    """
    Parse a simulation log file and extract key metrics.
    
    Args:
        filename (str): Path to the log file
    
    Returns:
        dict: A dictionary containing parsed metrics
    """
    with open(filename, 'r') as file:
        content = file.read()
    
    # Parse Queue metrics
    queue_metrics = parse_queue_section(content)
    
    # Parse Facility metrics
    facility_metrics = parse_facility_sections(content)
    
    return {
        'queue': queue_metrics,
        'facilities': facility_metrics
    }

def parse_queue_section(content):
    """
    Extract queue-related metrics from the log content.
    
    Args:
        content (str): Full log file content
    
    Returns:
        dict: Queue metrics
    """
    queue_pattern = r'\+.*QUEUE Order Queue.*\+\s*\|.*Time interval = (.*)\s*\|.*Incoming\s*(\d+)\s*\|.*Outcoming\s*(\d+)\s*\|.*Current length = (.*)\s*\|.*Maximal length = (\d+)\s*\|.*Average length = ([\d.]+)\s*\|.*Minimal time = ([\d.]+)\s*\|.*Maximal time = ([\d.]+)\s*\|.*Average time = ([\d.]+)\s*\|.*Standard deviation = ([\d.]+)'
    
    match = re.search(queue_pattern, content, re.DOTALL)
    
    if not match:
        return None
    
    return {
        'time_interval': match.group(1).strip(),
        'incoming': int(match.group(2)),
        'outcoming': int(match.group(3)),
        'current_length': float(match.group(4)),
        'maximal_length': int(match.group(5)),
        'average_length': float(match.group(6)),
        'minimal_time': float(match.group(7)),
        'maximal_time': float(match.group(8)),
        'average_time': float(match.group(9)),
        'standard_deviation': float(match.group(10))
    }

def parse_facility_sections(content):
    """
    Extract facility metrics from the log content.
    
    Args:
        content (str): Full log file content
    
    Returns:
        list: List of facility metrics dictionaries
    """
    facility_pattern = r'\+.*FACILITY.*\+\s*\|.*Status = (.*)\s*\|.*Time interval = (.*)\s*\|.*Number of requests = (\d+)\s*\|.*Average utilization = ([\d.]+)'
    
    facilities = []
    for match in re.finditer(facility_pattern, content, re.DOTALL):
        facility = {
            'status': match.group(1).strip(),
            'time_interval': match.group(2).strip(),
            'number_of_requests': int(match.group(3)),
            'average_utilization': float(match.group(4))
        }
        facilities.append(facility)
    
    return facilities

def analyze_facility_metrics(facilities):
    """
    Calculate aggregate metrics for facilities.
    
    Args:
        facilities (list): List of facility metrics dictionaries
    
    Returns:
        dict: Aggregate facility metrics
    """
    if not facilities:
        return None
    
    utilization_values = [f['average_utilization'] for f in facilities]
    
    return {
        'facilities_count': len(facilities),
        'utilization_min': min(utilization_values),
        'utilization_max': max(utilization_values),
        'utilization_avg': statistics.mean(utilization_values),
        'utilization_stddev': statistics.stdev(utilization_values) if len(utilization_values) > 1 else 0
    }

def main(filename):
    """
    Main function to parse and display simulation log metrics.
    
    Args:
        filename (str): Path to the log file
    """
    # Parse the log file
    parsed_data = parse_simulation_log(filename)
    
    # Print Queue Metrics
    print("Queue Metrics:")
    if parsed_data['queue']:
        for key, value in parsed_data['queue'].items():
            print(f"{key.replace('_', ' ').title()}: {value}")
    
    # Print Facility Metrics
    print("\nFacility Metrics:")
    for i, facility in enumerate(parsed_data['facilities'], 1):
        print(f"\nFacility {i}:")
        for key, value in facility.items():
            print(f"{key.replace('_', ' ').title()}: {value}")
    
    # Print Aggregate Facility Utilization Metrics
    facility_aggregate = analyze_facility_metrics(parsed_data['facilities'])
    print("\nAggregate Facility Utilization Metrics:")
    if facility_aggregate:
        for key, value in facility_aggregate.items():
            print(f"{key.replace('_', ' ').title()}: {value}")

# Example usage
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python script.py <log_file_path>")
        sys.exit(1)
    
    main(sys.argv[1])