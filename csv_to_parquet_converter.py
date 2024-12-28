#!/usr/bin/env python3
"""
CSV to Parquet Converter for Intraday History Data Analyzer
Converts all CSV files in the '07 Aug Exp' directory to Parquet format
while maintaining the same folder structure.
"""

import os
import pandas as pd
import logging
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('csv_to_parquet_conversion.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def convert_csv_to_parquet(csv_file_path, output_dir):
    """
    Convert a single CSV file to Parquet format.
    
    Args:
        csv_file_path (str): Path to the CSV file
        output_dir (str): Output directory for the Parquet file
    
    Returns:
        bool: True if conversion successful, False otherwise
    """
    try:
        # Read CSV file
        logger.info(f"Reading CSV file: {csv_file_path}")
        df = pd.read_csv(csv_file_path)
        
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)
        
        # Generate output file path
        csv_filename = os.path.basename(csv_file_path)
        parquet_filename = csv_filename.replace('.csv', '.parquet')
        parquet_file_path = os.path.join(output_dir, parquet_filename)
        
        # Convert to parquet
        logger.info(f"Converting to Parquet: {parquet_file_path}")
        df.to_parquet(parquet_file_path, index=False, compression='snappy')
        
        logger.info(f"Successfully converted: {csv_file_path} -> {parquet_file_path}")
        return True
        
    except Exception as e:
        logger.error(f"Error converting {csv_file_path}: {str(e)}")
        return False

def find_csv_files(root_dir):
    """
    Recursively find all CSV files in the given directory.
    
    Args:
        root_dir (str): Root directory to search for CSV files
    
    Returns:
        list: List of tuples (csv_file_path, relative_path)
    """
    csv_files = []
    root_path = Path(root_dir)
    
    for csv_file in root_path.rglob("*.csv"):
        # Get relative path from root directory
        relative_path = csv_file.relative_to(root_path)
        csv_files.append((str(csv_file), str(relative_path.parent)))
    
    return csv_files

def main():
    """
    Main function to convert all CSV files to Parquet format.
    """
    # Configuration
    source_dir = "07 Aug Exp"
    output_dir = "07 Aug Exp Parquet"
    max_workers = 4  # Number of parallel workers
    
    logger.info("Starting CSV to Parquet conversion process")
    logger.info(f"Source directory: {source_dir}")
    logger.info(f"Output directory: {output_dir}")
    
    # Check if source directory exists
    if not os.path.exists(source_dir):
        logger.error(f"Source directory '{source_dir}' does not exist!")
        return
    
    # Find all CSV files
    logger.info("Scanning for CSV files...")
    csv_files = find_csv_files(source_dir)
    
    if not csv_files:
        logger.warning("No CSV files found in the source directory!")
        return
    
    logger.info(f"Found {len(csv_files)} CSV files to convert")
    
    # Convert files
    successful_conversions = 0
    failed_conversions = 0
    
    start_time = time.time()
    
    # Use ThreadPoolExecutor for parallel processing
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        # Submit all conversion tasks
        future_to_file = {
            executor.submit(
                convert_csv_to_parquet, 
                csv_file_path, 
                os.path.join(output_dir, relative_path)
            ): csv_file_path 
            for csv_file_path, relative_path in csv_files
        }
        
        # Process completed tasks
        for future in as_completed(future_to_file):
            csv_file = future_to_file[future]
            try:
                success = future.result()
                if success:
                    successful_conversions += 1
                else:
                    failed_conversions += 1
            except Exception as e:
                logger.error(f"Exception occurred while converting {csv_file}: {str(e)}")
                failed_conversions += 1
    
    end_time = time.time()
    total_time = end_time - start_time
    
    # Summary
    logger.info("=" * 50)
    logger.info("CONVERSION SUMMARY")
    logger.info("=" * 50)
    logger.info(f"Total files processed: {len(csv_files)}")
    logger.info(f"Successful conversions: {successful_conversions}")
    logger.info(f"Failed conversions: {failed_conversions}")
    logger.info(f"Total time: {total_time:.2f} seconds")
    logger.info(f"Average time per file: {total_time/len(csv_files):.2f} seconds")
    logger.info("=" * 50)
    
    if failed_conversions == 0:
        logger.info("🎉 All files converted successfully!")
    else:
        logger.warning(f"⚠️  {failed_conversions} files failed to convert. Check the log for details.")

if __name__ == "__main__":
    main() 