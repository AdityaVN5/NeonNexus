import requests
import threading
import time
import random

BASE_URL = "http://localhost:3000/api/leaderboard"
NUM_USERS = 50
DURATION_SECONDS = 30

def worker(worker_id):
    start_time = time.time()
    while time.time() - start_time < DURATION_SECONDS:
        try:
            # 1. Submit Score
            user_id = random.randint(1, 1000000)
            score = random.randint(1, 100)
            requests.post(f"{BASE_URL}/submit", json={"user_id": user_id, "score": score})
            
            # 2. Check Rank
            requests.get(f"{BASE_URL}/rank/{user_id}")
            
            # 3. Check Top 10 (occasionally)
            if random.random() < 0.1:
                requests.get(f"{BASE_URL}/top")
                
        except Exception as e:
            print(f"Worker {worker_id} error: {e}")

threads = []
print(f"Starting load test with {NUM_USERS} concurrent users for {DURATION_SECONDS} seconds...")

for i in range(NUM_USERS):
    t = threading.Thread(target=worker, args=(i,))
    threads.append(t)
    t.start()

for t in threads:
    t.join()

print("Load test completed.")
