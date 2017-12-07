fid = fopen('pathsProfile1.csv');
pattern = textscan(fid,'%*s %s','Delimiter',',');
fclose(fid);
patternCat = categorical(pattern{1,1});
histogram(patternCat);
