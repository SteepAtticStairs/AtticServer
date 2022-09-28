# Required libraries
import matplotlib.pyplot as plt
from netCDF4 import Dataset
from cpt_convert import loadCPT # Import the CPT convert function
from matplotlib.colors import LinearSegmentedColormap # Linear interpolation for color maps

# Path to the GOES-R simulated image file
path = 'OR_ABI-L2-CMIPF-M3C13_G16_s20171141845379_e20171141856157_c20171141856233.nc'

# Open the file using the NetCDF4 library
nc = Dataset(path)

# Extract the Brightness Temperature values from the NetCDF
data = nc.variables['CMI'][:]

# Converts a CPT file to be used in Python
cpt = loadCPT('IR4AVHRR6.cpt')
# Makes a linear interpolation
cpt_convert = LinearSegmentedColormap('cpt', cpt)

# Show data
plt.axis('off')
# vmin=-25, vmax=153
plt.imshow(data, origin='upper', vmin=170, vmax=378, cmap=cpt_convert)
#plt.colorbar(location='bottom', label='Brightness Temperature [K]')
DPI = 500
plt.savefig('balls.png', dpi=DPI, bbox_inches='tight', pad_inches=0)