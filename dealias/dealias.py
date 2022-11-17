# First import needed modules.
# import cartopy.crs as ccrs
import matplotlib.pyplot as plt
import numpy as np
import pyart
import numpy as np
import sys

# radar = pyart.io.read('KCRP20170825_235733_V06')

# nyqVels = radar.instrument_parameters['nyquist_velocity']['data']

# # display = pyart.graph.RadarDisplay(radar)
# # fig = plt.figure(figsize=[8, 8])
# # ax = plt.subplot(2, 1, 1)
# # display.plot('reflectivity', sweep=2, fig=fig, ax=ax, vmin=0, vmax=60)
# # ax2 = plt.subplot(2, 1, 2)
# # display.plot('velocity', sweep=2, fig=fig, ax=ax2, vmin=-15, vmax=15, cmap='pyart_balance')
# # plt.savefig('balls.png')

# # Set the nyquist to what we see in the instrument parameter above.
# # Calculate the velocity texture
# vel_texture = pyart.retrieve.calculate_velocity_texture(radar, vel_field='velocity', wind_size=3, nyq=max(nyqVels))
# radar.add_field('velocity_texture', vel_texture, replace_existing=True)

# gatefilter = pyart.filters.GateFilter(radar)
# gatefilter.exclude_above('velocity_texture', 3)

# # At this point, we can simply used dealias_region_based to dealias the velocities
# # and then add the new field to the radar.
# nyq = radar.instrument_parameters['nyquist_velocity']['data'][0]
# velocity_dealiased = pyart.correct.dealias_region_based(radar, vel_field='velocity', nyquist_vel=nyq,
#                                                         centered=True, gatefilter=gatefilter)
# radar.add_field('corrected_velocity', velocity_dealiased, replace_existing=True)

# read in file
# KTLX20130520_201643_V06.gz
radar = pyart.io.read_nexrad_archive(sys.argv[1])
#radar = pyart.io.read_nexrad_archive('KBGM20200213_161126_V06')
#radar = pyart.io.read_nexrad_archive('KBGM20200213_161832_V06')

# extract first sweep
radar = radar.extract_sweeps([1]) # extract velocity sweep

# filter velocity less than 5
#gatefilter = pyart.correct.GateFilter(radar)
#gatefilter.exclude_below('reflectivity', 5)

# despeckle field
#gatefilter = pyart.correct.despeckle_field(radar, 'velocity')

# dealias velocity
corr_vel = pyart.correct.dealias_region_based(radar)
# print(corr_vel)
radar.add_field('dealiased_velocity', corr_vel, True)

data = radar.fields['dealiased_velocity']['data']
# print(radar.fields['velocity'])

curArr = []
finalArr = []
for n in np.arange(len(data)):
    for i in data[n]:
        if i != '--':
            curArr.append(i)
    finalArr.append(curArr)
    curArr = []

file = open('dealiased.txt', 'w+')
file.write(str(finalArr))
file.close()

# end = '['
# for i in data:
#     s = '[' + ', '.join(str(x) for x in data[0]) + '],'
#     s = s.replace('--', '0')
#     end += s
# end += ']'

# rmin = radar.fields['dealiased_velocity']['valid_min']
# rmax = radar.fields['dealiased_velocity']['valid_max']

# # # pyart_NWSVel
# fig = plt.figure(figsize=[10, 8])
# display = pyart.graph.RadarDisplay(radar)
# display.plot('dealiased_velocity', vmin=rmin, vmax=rmax, cmap='pyart_balance')
# #plt.show()