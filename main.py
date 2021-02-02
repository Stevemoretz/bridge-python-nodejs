from subprocess import Popen, PIPE

p = Popen(['node', 'n', 'Sahih s = {10 Jam 20 Jam {2 Zarb 32}}^\nSahih ssss'], stdin=PIPE, stdout=PIPE, stderr=PIPE)
output, err = p.communicate(b"input data that is passed to subprocess' stdin")
rc = p.returncode
print(repr(output.decode('ascii')))