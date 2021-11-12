from __future__ import unicode_literals, print_function, division
from io import open
import glob
import os
import csv
import numpy as np
import sys

def findFiles(path):
	return glob.glob(path)

#print(findFiles('data/names/*.txt'))

import unicodedata
import string

all_letters = string.ascii_letters + ".,;'"
n_letters = len(all_letters)
print(n_letters)

def unicodeToAscii(s):
	return ''.join(
			c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn' and c in all_letters
		)

transaction_data = []

def readLines(filename):
	lines = open(filename, encoding='utf-8').read().strip().split('\n')
	return [unicodeToAscii(line) for line in lines]


for filename in findFiles('data/*.csv'):
	with open(filename) as csv_file:
		csv_reader = csv.reader(csv_file, delimiter = ',')
		for id, row in enumerate(csv_reader):
			if id == 0:
				pass
			else:
				transaction_data.append([row[1], row[9]])

transaction_data = np.array(transaction_data)

complexity_levels = len(set(transaction_data[ : , 1]))

print(complexity_levels)
print("num of records: %d"%(len(transaction_data)))

import torch

def letterToIndex(letter):
	return all_letters.find(letter)

def letterToTensor(letter):
	tensor = torch.zeros(1, n_letters)
	tensor[0][letterToIndex(letter)] = 1
	return tensor

def lineToTensor(line):
	tensor = torch.zeros(len(line), 1, n_letters)
	for li, letter in enumerate(line):
		tensor[li][0][letterToIndex(letter)] = 1
		return tensor

import torch.nn as nn

class RNN(nn.Module):
	def __init__(self, input_size, hidden_size, output_size):
		super(RNN, self).__init__()
		self.hidden_size = hidden_size
		self.i2h = nn.Linear(input_size + hidden_size, hidden_size)
		self.i2o = nn.Linear(input_size + hidden_size, output_size)
		self.softmax = nn.LogSoftmax(dim = 1)

	def forward(self, input, hidden):
		combined = torch.cat((input, hidden), 1)
		hidden = self.i2h(combined)
		output = self.i2o(combined)
		output = self.softmax(output)
		return output, hidden

	def initHidden(self):
		return torch.zeros(1, self.hidden_size)

n_hidden = 128


def complexityLevelFromOutput(output):
	top_n, top_i = output.topk(1)
	complexity_i = top_i[0].item()
	return complexity_i

print("complexity level %d"%(complexity_levels))

import random

def randomChoice(l):
	return l[random.randint(0, len(l))]

def randomTrainingExample():
	transaction_record = randomChoice(transaction_data)
	complexity_level_tensor = torch.tensor([int(transaction_record[1]) - 1], dtype = torch.long)
	transaction_tensor = lineToTensor(transaction_record[0])
	return transaction_record, complexity_level_tensor, transaction_tensor

#for i in range(100):
#	transaction_record, complexity_level_tensor, transaction_tensor = randomTrainingExample()
	#print('transaction_level =', transaction_record[1], '/transaction=', transaction_record[0])

trainingIndx = random.randint(0, len(transaction_data), len(transaction_data)*0.8)
trainingSet = transaction_data[trainingIndx]
trainingSet = numpy.delete(transaction_data, trainingIndx, axis = 0)

learning_rate = 0.005

def train(transaction_tensor, complexity_level_tensor):
	hidden = rnn.initHidden()
	rnn.zero_grad()

	for i in range(transaction_tensor.size()[0]):
		output, hidden = rnn(transaction_tensor[i], hidden)

	loss = criterion(output, complexity_level_tensor)
	loss.backward()

	for p in rnn.parameters():
		p.data.add_(p.grad.data, alpha = -learning_rate)

	return output, loss.item()

criterion = nn.NLLLoss()

import time
import math

#n_iters = 100000
#print_every = 5000
#plot_every = 1000

n_iters = 100
print_every = 10
plot_every = 5

current_loss = 0
all_losses = []



def timeSince(since):
	now = time.time()
	s = now - since
	m = math.floor(s/60)
	s -= m*60
	return "%dm %ds" % (m, s)

start = time.time()


for iter in range(1, n_iters + 1):
	transaction_record, complexity_level_tensor, transaction_tensor = randomTrainingExample()
	output, loss = train(transaction_tensor, complexity_level_tensor)
	current_loss += loss

	if iter % print_every == 0:
		guess = complexityLevelFromOutput(output)
		correct = "yes" if guess == transaction_record[1] else 'no (%s)' % transaction_record[1]
		print('%d %d%% (%s) %.4f / %s %s %s' % (iter, iter / n_iters * 100, timeSince(start), loss, guess, correct, transaction_record[1]))

	if iter % plot_every == 0:
		all_losses.append(current_loss/plot_every)
		current_loss = 0

import matplotlib.pyplot as plt 
import matplotlib.ticker as ticker

plt.figure()
plt.plot(all_losses)

confusion = torch.zeros(complexity_levels, complexity_levels)
n_confusion = 100

def evaluate(transaction_tensor):
	hidden = rnn.initHidden()

	for i in range(transaction_tensor.size()[0]):
		output, hidden = rnn(transaction_tensor[i], hidden)

	return output

for i in range(n_confusion):
	transaction_record, complexity_level_tensor, transaction_tensor = randomTrainingExample()
	output = evaluate(transaction_tensor)
	guess = complexityLevelFromOutput(output)
	confusion[int(transaction_record[1])-1][guess] += 1

for i in range(complexity_levels):
	confusion[i] = confusion[i]/confusion[i].sum()

fig = plt.figure()
ax = fig.add_subplot(111)
cax = ax.matshow(confusion.numpy())
fig.colorbar(cax)

ax.set_xticklabels([''] + list(range(complexity_levels)), rotation = 90)
ax.set_yticklabels([''] + list(range(1, complexity_levels)))

ax.xaxis.set_major_locator(ticker.MultipleLocator(1))
ax.yaxis.set_major_locator(ticker.MultipleLocator(1))

plt.show()

def predict(input_line, n_predictions = 3):
	print('\n > %s' % input_line)
	with torch.no_grad():
		output = evaluate(lineToTensor(input_line))

		topv, topi = output.topk(n_predictions, 1, True)

		predictions = []

		for i in range(n_predictions):
			value = topv[0][i].item()
			complexity_level = topi[0][i].item()

			print('(%.2f)%s'%(value, complexity_level))

			predictions.append([value, complexity_level])

predict('stl#User:Homepage->User:Homepage')
