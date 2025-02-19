from flask import Flask, render_template, request

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/meeting')
def meeting():
    room_name = request.args.get('room', 'ShikshaSankalpDemoRoom')  # Default room
    user_name = request.args.get('user', 'User123')  # Default user
    return render_template('meeting.html', room_name=room_name, user_name=user_name)

if __name__ == '__main__':
    app.run(debug=True)
