package main.java.view;

import main.java.controller.RobotController;
import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.canvas.Canvas;
import javafx.scene.canvas.GraphicsContext;
import javafx.scene.layout.Background;
import javafx.scene.layout.BackgroundFill;
import javafx.scene.layout.CornerRadii;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Region;
import javafx.scene.layout.StackPane;
import javafx.stage.FileChooser;
import javafx.stage.FileChooser.ExtensionFilter;
import javafx.stage.Stage;
import javafx.util.Duration;
import javafx.animation.Timeline;

import java.io.File;
import java.util.HashSet;
import java.util.Set;

import javafx.animation.KeyFrame;
import javafx.scene.control.Button;
import javafx.scene.control.TextField;
import javafx.scene.input.KeyCode;
import javafx.scene.layout.VBox;
import javafx.scene.control.Slider;
import javafx.scene.control.Label;
import javafx.scene.paint.Color;
import main.java.model.common.Robot;
import main.java.model.common.Environment;
import main.java.model.room.AutonomousRobot;
import main.java.model.room.ControlledRobot;
import main.java.model.room.Room;
import main.java.model.common.Position;
import main.java.model.common.Obstacle;


/**
 * Main application class
 */
public class MainApp extends Application {
    private static final double APP_WIDTH = 900;
    private static final double APP_HEIGHT = 500;
    private static final int ROBOT_AREA_WIDTH = 700;
    private static final int ROBOT_AREA_HEIGHT = 500;
    private static final int BUTTON_WIDTH = 198;
    private static final int BUTTON_HEIGHT = 30;

    private static final String LEFTSIDE_BG = "34252F";
    private static final String BUTTONS_BG = "3B5249";


    private RobotView robotView = new RobotView();
    private ObstacleView obstacleView = new ObstacleView();
    private Environment environment;
    private Canvas canvas;
    private RobotController controller;
    private boolean recording = false;

    private static final Set<KeyCode> pressedKeys = new HashSet<>();

    @Override
    /**
     * Set up the GUI
     *
     * @param primaryStage the primary stage
     */
    public void start(Stage primaryStage) {
        // Create a canvas for drawing

        canvas = new Canvas(ROBOT_AREA_WIDTH, ROBOT_AREA_HEIGHT);
        GraphicsContext gc = canvas.getGraphicsContext2D();

        this.controller = new RobotController(environment, robotView, obstacleView, gc);

        Timeline timeline = new Timeline(
                new KeyFrame(Duration.millis(16.67), e -> {
                    controller.update();
                    if (recording) {
                        environment.log();
                    }
                }));
        timeline.setCycleCount(Timeline.INDEFINITE);
        timeline.play();

        String BUTTONS_STYLE = "-fx-display: inline-block; " +
                "-fx-outline: 0; " +
                "-fx-border: none; " +
                "-fx-cursor: pointer; " +
                "-fx-font-weight: bold; " +
                "-fx-border-radius: 4px; " +
                "-fx-font-size: 13px; " +
                "-fx-height: 30px; " +
                "-fx-background-color: #" + BUTTONS_BG + "; " +
                "-fx-text-fill: white; " +
                "-fx-padding: 0 20px;";

        // Inside the start method
        Slider speedSlider = new Slider();
        speedSlider.setMin(0.1); // min speed
        speedSlider.setMax(10); // max speed
        speedSlider.setValue(1); // default speed
        speedSlider.setShowTickLabels(true);
        speedSlider.setShowTickMarks(true);
        speedSlider.setMajorTickUnit(1);

        Label speedLabel = new Label("Robot Speed");
        speedLabel.setTextFill(Color.WHITE);
        speedLabel.setStyle("-fx-font-weight: bold;");

        Slider angleSlider = new Slider();
        angleSlider.setMin(0); // min angle
        angleSlider.setMax(360); // max angle
        angleSlider.setValue(45); // default angle
        angleSlider.setShowTickLabels(true);
        angleSlider.setShowTickMarks(true);
        angleSlider.setMajorTickUnit(45);

        Label angleLabel = new Label("Robot Angle");
        angleLabel.setTextFill(Color.WHITE);
        angleLabel.setStyle("-fx-font-weight: bold;");

        VBox sliderBox = new VBox(5);
        sliderBox.getChildren().addAll(angleLabel, angleSlider, speedLabel, speedSlider);
        sliderBox.setAlignment(Pos.CENTER);

        // Text inputs for coordinates
        TextField xCoordField = new TextField();
        xCoordField.setPromptText("X");
        xCoordField.setPrefSize(98, 30);

        TextField yCoordField = new TextField();
        yCoordField.setPromptText("Y");
        yCoordField.setPrefSize(98, 30);

        Button addObstacleBtn = new Button("Add Obstacle");
        addObstacleBtn.setOnAction(e -> {
            int[] coords = getCoordinates(xCoordField.getText(), yCoordField.getText());


            //make it in multiples of 20
            coords[0] = coords[0] - coords[0] % 20;
            coords[1] = coords[1] - coords[1] % 20;


            //size of obstacle is 20 so make sure it is in bounds of the room
            if (coords[0] < 10) {
                coords[0] = 10;
            } else if (coords[0] > ROBOT_AREA_WIDTH - 10) {
                coords[0] = ROBOT_AREA_WIDTH - 10;
            }

            if (coords[1] < 10) {
                coords[1] = 10;
            } else if (coords[1] > ROBOT_AREA_HEIGHT - 10) {
                coords[1] = ROBOT_AREA_HEIGHT - 10;
            }


            environment.createObstacleAt(new Position(coords[0], coords[1]));
        });

        Button addRobotBtn = new Button("Add CPU Robot");
        addRobotBtn.setOnAction(e -> {
            // Code to add robot
            int[] coords = getCoordinates(xCoordField.getText(), yCoordField.getText());
            int id = environment.getRobots().size();
            double speed = speedSlider.getValue();
            int angle = (int) angleSlider.getValue();


            //size of robot is 5 so make sure the robot is in bounds of the room
            if (coords[0] < 5) {
                coords[0] = 5;
            } else if (coords[0] > ROBOT_AREA_WIDTH - 5) {
                coords[0] = ROBOT_AREA_WIDTH - 5;
            }

            if (coords[1] < 5) {
                coords[1] = 5;
            } else if (coords[1] > ROBOT_AREA_HEIGHT - 5) {
                coords[1] = ROBOT_AREA_HEIGHT - 5;
            }


            //random angle
            double currentAngle = Math.random() * 360;

            AutonomousRobot.create(environment, new Position(coords[0], coords[1]), 1, speed, true, id, angle, currentAngle);

        });

        Button addControlledRobotBtn = new Button("Add Controlled Robot");
        addControlledRobotBtn.setOnAction(e -> {
            // Code to add robot
            int[] coords = getCoordinates(xCoordField.getText(), yCoordField.getText());
            int id = environment.getRobots().size();
            ControlledRobot.create(environment, new Position(coords[0], coords[1]), id, speedSlider.getValue());
        });

        Button startButton = new Button("▶");
        startButton.setOnAction(e -> timeline.play());

        Button stopButton = new Button("▐▐");
        stopButton.setOnAction(e -> timeline.stop());

        Button reverseButton = new Button("◀");
        reverseButton.setOnAction(e -> {
            timeline.stop();
            environment.rewind(this.controller);
            timeline.play();
        });

        Button startRecButton = new Button("Start Recording");
        startRecButton.setOnAction(e -> {
            environment.clearLog();
            recording = true;
        });

        Button stopRecButton = new Button("Stop Recording");
        stopRecButton.setOnAction(e -> {
            recording = false;
            environment.stopLog();
        });
        stopRecButton.setPrefSize(BUTTON_WIDTH, BUTTON_HEIGHT);
        startRecButton.setPrefSize(BUTTON_WIDTH, BUTTON_HEIGHT);
        startRecButton.setStyle(BUTTONS_STYLE + "-fx-background-color: #" + "519872" + "; ");
        stopRecButton.setStyle(BUTTONS_STYLE + "-fx-background-color: #" + "519872" + "; ");

        startButton.setPrefSize(60, 30);
        stopButton.setPrefSize(60, 30);
        reverseButton.setPrefSize(60, 30);
        startButton.setStyle(BUTTONS_STYLE + "-fx-background-color: #" + "519872" + "; ");
        stopButton.setStyle(BUTTONS_STYLE + "-fx-background-color: #" + "519872" + "; ");
        reverseButton.setStyle(BUTTONS_STYLE + "-fx-background-color: #" + "519872" + "; ");

        HBox timeButtons = new HBox(5);
        timeButtons.getChildren().addAll(startButton, stopButton, reverseButton);
        timeButtons.setAlignment(javafx.geometry.Pos.CENTER);

        FileChooser fileChooser = new FileChooser();
        fileChooser.setTitle("Load Environment");
        fileChooser.getExtensionFilters().addAll(new ExtensionFilter("Text Files", "*.json"));
        Button loadBtn = new Button("Load Environment");
        loadBtn.setOnAction(e -> {
            File file = fileChooser.showOpenDialog(primaryStage);
            if (file != null) {
                environment.clear();
                environment.preload(file);
            }

        });

        Button saveBtn = new Button("Save Environment");
        saveBtn.setOnAction(e -> {
            environment.save();
        });

        addRobotBtn.setPrefSize(BUTTON_WIDTH, BUTTON_HEIGHT);
        addObstacleBtn.setPrefSize(BUTTON_WIDTH, BUTTON_HEIGHT);
        addControlledRobotBtn.setPrefSize(BUTTON_WIDTH, BUTTON_HEIGHT);
        loadBtn.setPrefSize(BUTTON_WIDTH, BUTTON_HEIGHT);
        saveBtn.setPrefSize(BUTTON_WIDTH, BUTTON_HEIGHT);
        addObstacleBtn.setStyle(BUTTONS_STYLE);
        addRobotBtn.setStyle(BUTTONS_STYLE);
        addControlledRobotBtn.setStyle(BUTTONS_STYLE);
        loadBtn.setStyle(BUTTONS_STYLE);
        saveBtn.setStyle(BUTTONS_STYLE);

        HBox coords = new HBox(2);
        coords.getChildren().addAll(xCoordField, yCoordField);

        VBox controlButtons = new VBox(5);
        controlButtons.getChildren().addAll(sliderBox, coords, addObstacleBtn, addRobotBtn, addControlledRobotBtn);
        controlButtons.setAlignment(javafx.geometry.Pos.CENTER_LEFT);

        // empty spacers
        Region spacer = new Region();
        spacer.setPrefHeight(10);
        Region spacer2 = new Region();
        spacer2.setPrefHeight(20);

        VBox leftSide = new VBox(5);
        leftSide.getChildren().addAll(spacer, timeButtons, startRecButton, stopRecButton, spacer2, controlButtons,
                loadBtn, saveBtn);

        HBox hBox = new HBox(5);
        hBox.getChildren().addAll(leftSide, canvas);
        hBox.setAlignment(javafx.geometry.Pos.CENTER_RIGHT);

        // Create the root pane
        StackPane root = new StackPane();
        root.setBackground(
                new Background(new BackgroundFill(Color.valueOf(LEFTSIDE_BG), CornerRadii.EMPTY, Insets.EMPTY)));
        root.getChildren().add(hBox);

        // Create the scene
        Scene scene = new Scene(root, APP_WIDTH, APP_HEIGHT);

        scene.setOnKeyPressed(event -> pressedKeys.add(event.getCode()));
        scene.setOnKeyReleased(event -> pressedKeys.remove(event.getCode()));

        primaryStage.setTitle("Robot Simulation");
        primaryStage.setScene(scene);
        primaryStage.show();

        // Draw a robot
        for (Robot robot : environment.getRobots()) {
            robotView.draw(robot, gc);
        }

        // Draw an obstacle
        for (Obstacle obstacle : environment.getObstacles()) {
            obstacleView.draw(obstacle, gc);
        }

    }

    /**
     * Initialize the environment
     */
    @Override
    public void init() throws Exception {
        super.init();
        environment = Room.create(ROBOT_AREA_WIDTH, ROBOT_AREA_HEIGHT);

    }

    /**
     * Get coordinates from text fields
     *
     * @param coordx the x coordinate
     * @param coordy the y coordinate
     * @return the coordinates
     */
    private int[] getCoordinates(String coordx, String coordy) {

        int resX = 0;
        int resY = 0;
        if (coordx.isEmpty() || coordy.isEmpty()) {
            // if no input, try random position
            resX = (int) (Math.random() * ROBOT_AREA_WIDTH);
            resY = (int) (Math.random() * ROBOT_AREA_HEIGHT);
        } else {
            resX = Integer.parseInt(coordx);
            resY = Integer.parseInt(coordy);
        }
        return new int[] { resX, resY };
    }

    public static boolean isKeyPressed(KeyCode key) {
        return pressedKeys.contains(key);
    }

    public static void main(String[] args) {
        launch(args);
    }
}
