all:
	mkdir -p bin
	g++ -Wall -o bin/UCC -DUNIX -O3 src/*.cpp

clean:
	rm -f bin/UCC bin/UCC.exe
	rmdir --ignore-fail-on-non-empty bin
