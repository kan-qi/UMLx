class CompositeClassUnit implements Set<ClassUnit>{
		Set<ClassUnit> classUnits;
		String name;
		String uuid;

		public CompositeClassUnit(String name) {
			this.classUnits = new HashSet<ClassUnit>();
			this.name = name;
			this.uuid = UUID.randomUUID().toString();
		}

		public boolean contains(ClassUnit classUnit) {
			return classUnits.contains(classUnit);
		}

		public String toJSONString() {
			Iterator<ClassUnit> iterator = classUnits.iterator();
			StringBuilder Json = new StringBuilder();
			Json.append("{\"name\": \""+name+"\",");
			Json.append("\"UUID\": \""+uuid+"\",");
			Json.append("\"classUnits\": [");
			while(iterator.hasNext()) {
				ClassUnit classUnit = iterator.next();
				Json.append("\""+classUnit.uuid+"\"");
				if(iterator.hasNext()) {
					Json.append(",");
				}
			}
			Json.append("]}");
			return Json.toString();
		}

		@Override
		public boolean add(ClassUnit e) {
			return this.classUnits.add(e);
		}

		@Override
		public boolean addAll(Collection<? extends ClassUnit> c) {
			return this.classUnits.addAll(c);
		}

		@Override
		public void clear() {
			this.classUnits.clear();

		}

		@Override
		public boolean contains(Object o) {
			return this.classUnits.contains(o);
		}

		@Override
		public boolean containsAll(Collection<?> c) {
			return this.classUnits.containsAll(c);
		}

		@Override
		public boolean isEmpty() {
			return this.classUnits.isEmpty();
		}

		@Override
		public Iterator<ClassUnit> iterator() {
			return this.classUnits.iterator();
		}

		@Override
		public boolean remove(Object o) {
			return this.classUnits.remove(0);
		}

		@Override
		public boolean removeAll(Collection<?> c) {
			return this.classUnits.removeAll(c);
		}

		@Override
		public boolean retainAll(Collection<?> c) {
			return this.classUnits.retainAll(c);
		}

		@Override
		public int size() {
			return this.classUnits.size();
		}

		@Override
		public Object[] toArray() {
			return this.classUnits.toArray();
		}

		@Override
		public <T> T[] toArray(T[] a) {
			return this.classUnits.toArray(a);
		}
	}