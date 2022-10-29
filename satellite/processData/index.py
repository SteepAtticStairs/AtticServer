# Required libraries
import sys

import matplotlib.pyplot as plt
from netCDF4 import Dataset
import metpy
from cpt_convert import loadCPT # Import the CPT convert function
from matplotlib.colors import LinearSegmentedColormap # Linear interpolation for color maps
import numpy as np
#import cartopy.crs as ccrs
import xarray

channel = sys.argv[1]
sector = sys.argv[2]
inputFileName = sys.argv[3]
outputFileName = sys.argv[4]

# Path to the GOES-R simulated image file
path = inputFileName

# Open the file using the NetCDF4 library
nc = Dataset(path)
# if channel == 'veggie' or channel == 'truecolor':
#     # OR_ABI-L2-MCMIPC-M6_G16_s20223011651175_e20223011653548_c20223011654051.nc
#     FILE = (inputFileName)
#     C = xarray.open_dataset(FILE)
# else:
#     # Open the file using the NetCDF4 library
#     nc = Dataset(path)

#     # Extract the Brightness Temperature values from the NetCDF
#     data = nc.variables['CMI'][:]

# fulldisk = 489.25
# conus = 504.125
if sector == 'conus':
    DPI = 504.125
elif sector == 'fulldisk':
    DPI = 489.25

if channel == '13' or channel == '14' or channel == '15':
    data = nc.variables['CMI'][:]
    # convert kelvin to celsius
    data = data - 273.15

    # Converts a CPT file to be used in Python
    cpt = loadCPT('colortables/IR4AVHRR6.cpt')
    # Makes a linear interpolation
    cpt_convert = LinearSegmentedColormap('cpt', cpt)

    # Show data
    plt.axis('off')
    # vmin=-25, vmax=153
    # original is vmin=170, vmax=378
    plt.imshow(data, origin='upper', vmin=-103, vmax=84, cmap=cpt_convert)
    #plt.colorbar(location='bottom', label='Brightness Temperature [K]')
    plt.savefig(outputFileName, dpi=DPI, bbox_inches='tight', pad_inches=0)

    # plt.axis('off')
    # fig = plt.figure(figsize=(15, 12))

    # # Generate an Cartopy projection
    # lc = ccrs.LambertConformal(central_longitude=-97.5, standard_parallels=(38.5, 38.5))

    # ax = fig.add_subplot(1, 1, 1, projection=lc)
    # ax.set_extent([-135, -60, 10, 65], crs=ccrs.PlateCarree())

    # # Add the RGB image to the figure. The data is in the same projection as the
    # # axis we just created.
    # ax.imshow(data, origin='upper', vmin=-103, vmax=84, cmap=cpt_convert,
    #         extent=(x.min(), x.max(), y.min(), y.max()), transform=geos, interpolation='none')

    # # Add Coastlines and States
    # ax.coastlines(resolution='50m', color='black', linewidth=0.25)
    # ax.add_feature(ccrs.cartopy.feature.STATES, linewidth=0.25)

    # plt.savefig(outputFileName, dpi=DPI, bbox_inches='tight', pad_inches=0)
elif channel == '08' or channel == '09' or channel == '10':
    data = nc.variables['CMI'][:]
    # Converts a CPT file to be used in Python
    cpt = loadCPT('colortables/WVCOLOR35.cpt')
    # Makes a linear interpolation
    cpt_convert = LinearSegmentedColormap('cpt', cpt)

    # Show data
    plt.axis('off')
    # vmin=-25, vmax=153
    plt.imshow(data, origin='upper', vmin=170, vmax=378, cmap=cpt_convert)
    #plt.colorbar(location='bottom', label='Brightness Temperature [K]')
    plt.savefig(outputFileName, dpi=DPI, bbox_inches='tight', pad_inches=0)
elif channel == '01' or channel == '02' or channel == '03' or channel == '04' or channel == '05' or channel == '06' or channel == '07' or channel == '11' or channel == '12' or channel == '16':
    data = nc.variables['CMI'][:]
    data = np.sqrt(data)
    # Show data
    plt.axis('off')
    # vmin=-25, vmax=153
    plt.imshow(data, origin='upper', vmin=0, vmax=1, cmap='Greys_r')
    #plt.colorbar(location='bottom', label='Brightness Temperature [K]')
    plt.savefig(outputFileName, dpi=DPI, bbox_inches='tight', pad_inches=0)
elif channel == 'veggie' or channel == 'truecolor':
    # Load the three channels into appropriate R, G, and B variables
    R = nc.variables['CMI_C02'][:]
    G = nc.variables['CMI_C03'][:]
    B = nc.variables['CMI_C01'][:]

    # Apply range limits for each channel. RGB values must be between 0 and 1
    R = np.clip(R, 0, 1)
    G = np.clip(G, 0, 1)
    B = np.clip(B, 0, 1)

    # Apply a gamma correction to the image to correct ABI detector brightness
    gamma = 2.2
    R = np.power(R, 1/gamma)
    G = np.power(G, 1/gamma)
    B = np.power(B, 1/gamma)

    # Calculate the "True" Green
    G_true = 0.45 * R + 0.1 * G + 0.45 * B
    G_true = np.clip(G_true, 0, 1)  # apply limits again, just in case.

    # The RGB array with the raw veggie band
    RGB_veggie = np.dstack([R, G, B])

    # The RGB array for the true color image
    RGB = np.dstack([R, G_true, B])

    cleanIR = nc.variables['CMI_C13'][:]

    # Normalize the channel between a range.
    #       cleanIR = (cleanIR-minimumValue)/(maximumValue-minimumValue)
    cleanIR = (cleanIR-90)/(313-90)

    # Apply range limits to make sure values are between 0 and 1
    cleanIR = np.clip(cleanIR, 0, 1)

    # Invert colors so that cold clouds are white
    cleanIR = 1 - cleanIR

    # Lessen the brightness of the coldest clouds so they don't appear so bright
    # when we overlay it on the true color image.
    cleanIR = cleanIR/1.4

    # Yes, we still need 3 channels as RGB values. This will be a grey image.
    RGB_cleanIR = np.dstack([cleanIR, cleanIR, cleanIR])

    plt.axis('off')
    if channel == 'veggie':
        RGB_veggieNight = np.dstack([np.maximum(R, cleanIR), np.maximum(G, cleanIR),
                            np.maximum(B, cleanIR)])
        plt.imshow(RGB_veggieNight)
    elif channel == 'truecolor':
        # Maximize the RGB values between the True Color Image and Clean IR image
        # RGB_ColorIR
        RGB_truecolorNight = np.dstack([np.maximum(R, cleanIR), np.maximum(G_true, cleanIR),
                            np.maximum(B, cleanIR)])
        plt.imshow(RGB_truecolorNight)
    plt.savefig(outputFileName, dpi=DPI, bbox_inches='tight', pad_inches=0)