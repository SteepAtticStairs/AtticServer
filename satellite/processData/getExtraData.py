import sys

from netCDF4 import Dataset
import xarray
from pyproj import CRS, Proj, transform, Transformer

fileName = sys.argv[1]
mode = sys.argv[2]
satNum = sys.argv[3]
sector = sys.argv[4]

# 'data/OR_ABI-L2-CMIPC-M6C13_G16_s20223020056176_e20223020058560_c20223020059031.nc'
FILE = (fileName)
#nc = Dataset(FILE)
C = xarray.open_dataset(FILE)

# for item in C:
#     print(item)
if mode == 'proj4str':
    cc = CRS.from_cf(C.goes_imager_projection.attrs)
    print(cc.to_proj4())
elif mode == 'wldFile':
    print('nothing here yet')
    # proj4str = '+proj=geos +sweep=x +lon_0=-75 +h=35786023 +x_0=0 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs'
    # # print(C.geospatial_lat_lon_extent.attrs)
    # # print(C.geospatial_lat_lon_extent)
    # minx = -152.10928
    # miny = 14.57134
    # maxx = -52.94688
    # maxy = 56.76145
    # centery = 30.083002
    # centerx = -87.096954

    # # lon, lat
    # topLeft = [minx, maxy]
    # bottomRight = [maxx, miny]
    # # for item in C:
    # #     print(C[item])

# 2004.0173154875
# 0.0000000000
# 0.0000000000
# -2004.0173154875
# -3626269.3323096111
# 4588197.7562267482

# for item in nc.variables:
#     print(item)
# print(nc.variables['geospatial_lat_lon_extent'])

# CMI
# DQF
# t
# y
# x
# time_bounds
# goes_imager_projection
# y_image
# y_image_bounds
# x_image
# x_image_bounds
# nominal_satellite_subpoint_lat
# nominal_satellite_subpoint_lon
# nominal_satellite_height
# geospatial_lat_lon_extent
# band_wavelength
# band_id
# total_number_of_points
# valid_pixel_count
# outlier_pixel_count
# min_brightness_temperature
# max_brightness_temperature
# mean_brightness_temperature
# std_dev_brightness_temperature
# planck_fk1
# planck_fk2
# planck_bc1
# planck_bc2
# algorithm_dynamic_input_data_container
# percent_uncorrectable_GRB_errors
# percent_uncorrectable_L0_errors
# earth_sun_distance_anomaly_in_AU
# processing_parm_version_container
# algorithm_product_version_container
# esun
# kappa0
# focal_plane_temperature_threshold_exceeded_count
# maximum_focal_plane_temperature
# focal_plane_temperature_threshold_increasing
# focal_plane_temperature_threshold_decreasing
# channel_integration_time
# channel_gain_field