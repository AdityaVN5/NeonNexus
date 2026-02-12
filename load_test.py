import requests
import threading
import time
import random

API_URL = "http://localhost:3000/api/leaderboard"
NUM_USERS = 50
REQUESTS_PER_USER = 20

def simulate_user(user_id):
    """Simulates a user submitting scores and checking leaderboard."""
    for _ in range(REQUESTS_PER_USER):
        try:
            # 80% chance to view leaderboard (Read heavy)
            if random.random() < 0.8:
                requests.get(f"{API_URL}/top")
            else:
                # 20% chance to submit score (Write)
                score = random.randint(10, 100)
                requests.post(f"{API_URL}/submit", json={"userId": user_id, "score": score})
            
            # Sleep a bit to simulate think time
            time.sleep(random.uniform(0.1, 0.5))
            
        except Exception as e:
            print(f"Error for user {user_id}: {e}")

def run_load_test():
    print(f"Starting load test with {NUM_USERS} concurrent users...")
    threads = []
    
    start_time = time.time()
    
    for i in range(NUM_USERS):
        # Use random user IDs from our seeded range (1 to 1,000,000)
        # Choosing a smaller subset (e.g. 1-1000) creates more contention for locking demo
        target_user_id = random.randint(1, 1000) 
        t = threading.Thread(target=simulate_user, args=(target_user_id,))
        threads.append(t)
        t.start()
        
    for t in threads:
        t.join()
        
    duration = time.time() - start_time
    print(f"Load test completed in {duration:.2f} seconds.")

if __name__ == "__main__":
    run_load_test()
